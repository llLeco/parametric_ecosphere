export class InsPolicyRegisteredEvent {
  constructor(
    public readonly policyId: string,
    public readonly consensusTimestamp: string,
  ) {}
}


