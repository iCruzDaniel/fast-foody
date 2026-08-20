import { EventPublisherPort } from '@domain/order';
import { DomainEvent } from '@shared/kernel';

export class ConsoleEventPublisher implements EventPublisherPort {
  async publish(event: DomainEvent): Promise<void> {
    const eventData = {
      event: event.constructor.name,
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    };

    console.log(JSON.stringify(eventData, null, 2));
  }
}