export function normalizeEntityId<T extends { _id?: string; id?: string }>(
  entity: T,
): T & { id: string } {
  return { ...entity, id: entity.id ?? entity._id ?? "" };
}
