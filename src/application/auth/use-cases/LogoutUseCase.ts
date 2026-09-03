import { DomainError } from '@shared/kernel';

export class LogoutUseCase {
  async execute(): Promise<void> {
    // Stateless — client clears the cookie server has nothing to invalidate
    return;
  }
}