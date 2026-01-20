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
        this.logger.log(
          `Queue: processing order ${orderId} | Job ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`,
        )
        try {
          const result = await this.orderProcessor.processOrder(orderId)
          this.logger.log(`Queue: order ${orderId} processed successfully | Job ID: ${job.id}`)
          return result
        } catch (error) {
          this.logger.error(
            `Queue: order ${orderId} processing failed | Job ID: ${job.id} | Error: ${error.message}`,
          )
          throw error
        }
      }

      case 'expired-order': {
        const { orderId } = job.data as { orderId: string }
        this.logger.log(
          `Queue: expiring order ${orderId} | Job ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`,
        )
        try {
          const result = await this.orderProcessor.expireOrder(orderId)
          this.logger.log(`Queue: order ${orderId} expired successfully | Job ID: ${job.id}`)
          return result
        } catch (error) {
          this.logger.error(
            `Queue: order ${orderId} expiration failed | Job ID: ${job.id} | Error: ${error.message}`,
          )
          throw error
        }
      }
      default:
        this.logger.warn(`Process Order: Unknown job name ${job.name}.`)
        return `Unknown job name ${job.name}.`
    }
  }
}
