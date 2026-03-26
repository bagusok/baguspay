import { BadRequestException } from '@nestjs/common'
import { PinService } from './pin.service'

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pin: string) => `hashed-${pin}`),
  compare: jest.fn(async (pin: string, hash: string) => hash === `hashed-${pin}`),
}))

type UpdateChain = {
  set: jest.Mock<any, any>
  where: jest.Mock<any, any>
}

type MockDb = {
  query: {
    users: {
      findFirst: jest.Mock<any, any>
    }
  }
  update: jest.Mock<any, any>
}

function createMockDb(user: any): { db: MockDb; lastUpdatePayload: any } {
  let lastUpdatePayload: any = null
  const makeUpdateChain = (): UpdateChain => ({
    set: jest.fn((payload) => {
      lastUpdatePayload = payload
      return {
        where: jest.fn().mockResolvedValue(undefined),
      }
    }),
    where: jest.fn().mockResolvedValue(undefined),
  })

  const db: MockDb = {
    query: {
      users: {
        findFirst: jest.fn().mockResolvedValue(user),
      },
    },
    update: jest.fn().mockImplementation(() => makeUpdateChain()),
  }

  return { db, lastUpdatePayload }
}

describe('PinService', () => {
  const userId = 'user-123'

  it('throws when PIN not set', async () => {
    const { db } = createMockDb({ pin_hash: null })
    const service = new PinService({ db } as any)

    await expect(service.verifyPin(userId, '123456')).rejects.toBeInstanceOf(BadRequestException)
  })

  it('throws when PIN is locked', async () => {
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000)
    const { db } = createMockDb({ pin_hash: 'hashed-123456', pin_locked_until: lockedUntil })
    const service = new PinService({ db } as any)

    await expect(service.verifyPin(userId, '123456')).rejects.toBeInstanceOf(BadRequestException)
  })

  it('resets attempts on successful verification', async () => {
    const { db, lastUpdatePayload } = createMockDb({
      id: userId,
      pin_hash: 'hashed-123456',
      pin_attempts: 2,
      pin_locked_until: null,
    })
    const service = new PinService({ db } as any)

    await service.verifyPin(userId, '123456')

    expect(lastUpdatePayload).toEqual(
      expect.objectContaining({ pin_attempts: 0, pin_locked_until: null }),
    )
  })

  it('locks after max failed attempts', async () => {
    const { db, lastUpdatePayload } = createMockDb({
      id: userId,
      pin_hash: 'hashed-000000',
      pin_attempts: 2,
      pin_locked_until: null,
    })
    const service = new PinService({ db } as any)

    await expect(service.verifyPin(userId, '123456')).rejects.toBeInstanceOf(BadRequestException)

    expect(lastUpdatePayload).toEqual(
      expect.objectContaining({ pin_attempts: 0, pin_locked_until: expect.any(Date) }),
    )
  })

  it('hashes and stores PIN on setPin', async () => {
    const { db, lastUpdatePayload } = createMockDb({ id: userId })
    const service = new PinService({ db } as any)

    await service.setPin(userId, '123456')

    expect(lastUpdatePayload).toEqual(
      expect.objectContaining({
        pin_hash: 'hashed-123456',
        pin_attempts: 0,
        pin_locked_until: null,
      }),
    )
  })

  it('changes PIN after verifying current', async () => {
    const { db, lastUpdatePayload } = createMockDb({
      id: userId,
      pin_hash: 'hashed-111111',
      pin_attempts: 0,
      pin_locked_until: null,
    })
    const service = new PinService({ db } as any)

    await service.changePin(userId, '111111', '222222')

    expect(lastUpdatePayload).toEqual(
      expect.objectContaining({
        pin_hash: 'hashed-222222',
        pin_attempts: 0,
        pin_locked_until: null,
      }),
    )
  })
})
