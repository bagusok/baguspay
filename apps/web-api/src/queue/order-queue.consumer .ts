import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { OrderProcessor } from 'src/order/processor/order.processor'

@Processor('orders-queue')
export class OrderQueueConsumer extends WorkerHost {
  private logger = new Logger(OrderQueueConsumer.name)

  constructor(private readonly orderProcessor: OrderProcessor) {
    super()
  }

  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'process-order': {
        const { orderId } = job.data as { orderId: string }
        this.logger.log(`Queue: processing order ${orderId}`)
        return this.orderProcessor.processOrder(orderId)
      }

      case 'expired-order': {
        const { orderId } = job.data as { orderId: string }
        this.logger.log(`Queue: expiring order ${orderId}`)
        return this.orderProcessor.expireOrder(orderId)
      }
      default:
        this.logger.warn(`Process Order: Unknown job name ${job.name}.`)
        return `Unknown job name ${job.name}.`
    }
  }
}
