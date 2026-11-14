import 'reflect-metadata';
import type { StandardJSONSchemaV1, StandardSchemaV1 } from '@standard-schema/spec';
import { HttpError } from '../errors';

export const ParameterSchemaMetadata = Symbol.for('ParameterSchema');

/**
 * Any [Standard Schema](https://standardschema.dev) (zod, valibot, arktype, ...).
 * When it also implements Standard JSON Schema (zod >= 4.2, arktype) it
 * describes the parameter in generated MCP tool definitions.
 */
export type ParameterSchema = StandardSchemaV1;

export interface ParameterSchemaEntry {
  /** the path or header name, `body` for the body */
  name: string;
  schema: ParameterSchema;
}

/** parameter index → schema */
export type ParameterSchemas = Record<number, ParameterSchemaEntry>;

export function setParameterSchema(target: object, key: string | symbol | undefined, index: number, entry: ParameterSchemaEntry): void {
  const stored = getParameterSchemas(target, key);
  stored[index] = entry;
  Reflect.defineMetadata(ParameterSchemaMetadata, stored, target, key as string | symbol);
}

export function getParameterSchemas(target: object, key: string | symbol | undefined): ParameterSchemas {
  return Reflect.getMetadata(ParameterSchemaMetadata, target, key as string | symbol) || {};
}

function formatIssue(name: string, issue: StandardSchemaV1.Issue): string {
  const path = (issue.path ?? []).map((segment) => String(typeof segment === 'object' ? segment.key : segment));
  return `${[name, ...path].join('.')}: ${issue.message}`;
}

/**
 * Validate `args` against the schemas of their parameters.
 * Returns the arguments with each validated one replaced by the schema's
 * output (coerced, defaulted); throws a 400 `HttpError` listing every issue.
 */
export async function validateArguments(schemas: ParameterSchemas, args: unknown[]): Promise<unknown[]> {
  const validated = [...args];
  const issues: string[] = [];

  for (const [index, { name, schema }] of Object.entries(schemas)) {
    const result = await schema['~standard'].validate(args[Number(index)]);

    if (result.issues) {
      issues.push(...result.issues.map((issue) => formatIssue(name, issue)));
    } else {
      validated[Number(index)] = result.value;
    }
  }

  if (issues.length) {
    throw new HttpError(400, `Invalid request: ${issues.join('; ')}`, issues);
  }

  return validated;
}

function hasJsonSchema(schema: ParameterSchema): schema is ParameterSchema & StandardJSONSchemaV1 {
  return typeof (schema['~standard'] as Partial<StandardJSONSchemaV1.Props>).jsonSchema?.input === 'function';
}

/**
 * The JSON Schema of what the parameter accepts, or `undefined` when the
 * schema library cannot produce one.
 */
export function toJsonSchema(schema: ParameterSchema | undefined): Record<string, unknown> | undefined {
  if (!schema || !hasJsonSchema(schema)) {
    return undefined;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $schema, ...jsonSchema } = schema['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
    return jsonSchema;
  } catch {
    // converters may throw for types JSON Schema cannot express
    return undefined;
  }
}
