export type Resource<T> = [string, { Type: string; Properties: T }];
export type AnyResource = Resource<object>;
type AWSResourceType = `AWS::${string}`;

export function res<T>(
  name: string,
  Type: AWSResourceType,
  Properties: T,
): Resource<T> {
  return [name, { Type, Properties }];
}

export function assertNoDuplicates<T>(resources: Resource<T>[]) {
  const names = resources.map(([name, _]) => name);
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate resource names: ${duplicates.join(", ")}`);
  }
}

export function resourcesToStack<T>(resources: Resource<T>[]): object {
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

export function FnGetAtt(res: AnyResource, att: string) {
  return { "Fn::GetAtt": [res[0], att] };
}

export function Ref(res: AnyResource) {
  return { Ref: res[0] };
}
