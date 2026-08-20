import { DomainEvent } from '@shared/kernel';

export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
}