export type Resource = [string, object];
type AWSResourceType = `AWS::${string}`;

export function res(
  name: string,
  Type: AWSResourceType,
  Properties: object,
): Resource {
  return [name, { Type, Properties }];
}

export function assertNoDuplicates(resources: Resource[]) {
  const names = resources.map(([name, _]) => name);
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate resource names: ${duplicates.join(", ")}`);
  }
}

export function resourcesToStack(resources: Resource[]): object {
  const stack: Record<string, object> = {};
  for (const [name, obj] of resources) {
    stack[name] = obj;
  }
  return stack;
}

export function mustEnv(name: string) {
  const value = Deno.env.get(name);
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
