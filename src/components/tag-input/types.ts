/**
 * Configuration for how a tag should handle duplicate values
 */
export type TagDuplicateHandling = "overwrite" | "array" | "join";

import { LucideIcon } from "lucide-react";

/**
 * Base tag option configuration
 */
interface BaseTagOptionConfig<T extends string = string> {
  tag: T;
  icon?: LucideIcon; // Optional LucideIcon component for visual representation
}

/**
 * Tag option config for 'overwrite' type
 */
interface OverwriteTagConfig<T extends string = string>
  extends BaseTagOptionConfig<T> {
  type: "overwrite";
}

/**
 * Tag option config for 'array' type
 */
interface ArrayTagConfig<T extends string = string>
  extends BaseTagOptionConfig<T> {
  type: "array";
}

/**
 * Tag option config for 'join' type
 */
interface JoinTagConfig<T extends string = string>
  extends BaseTagOptionConfig<T> {
  type: "join";
  separator?: string; // Only available for 'join' type
}

/**
 * Extended tag option configuration with duplicate handling
 * Uses discriminated union type to make separator only available when type is 'join'
 */
export type TagOptionConfig<T extends string = string> =
  | OverwriteTagConfig<T>
  | ArrayTagConfig<T>
  | JoinTagConfig<T>;

/**
 * Type for individual tag options which can be either string or TagOptionConfig
 */
export type TagOption<T extends string = string> = T | TagOptionConfig<T>;

/**
 * Represents a parsed tag field with a tag name and its associated value.
 * @template T - The type parameter constraining the tag name to a string type.
 */
interface ParsedField<T extends string = string> {
  tag: T;
  value: string;
}

/**
 * Type representing the tag values, which can be a string for 'overwrite' and 'join',
 * or an array of strings or a single string for 'array'
 */
export type TagValue<T extends TagDuplicateHandling = TagDuplicateHandling> =
  T extends "array" ? string | string[] : string;

/**
 * Custom type representing the structured value for a TagInput component.
 * @template T - The type parameter constraining the tag name to a string type.
 * @property {string} default - The default text content (text without tags).
 * @property {Record<T, TagValue>} tags - A record of tag names to their values.
 */
export type TagInputValue<T extends string = string> = {
  default: string;
  tags: Record<ParsedField<T>["tag"], TagValue>;
};

/**
 * Props interface for the TagInput component.
 * @template T - The type parameter constraining the tag names to a string type.
 */
export interface TagInputProps<T extends string = string> {
  tagOptions?: TagOption<T>[];
  value?: TagInputValue<T>;
  onChange?: (parsedValue: TagInputValue<T>, value: string) => void;
  placeholder?: string;
  defaultDuplicateHandling?: TagDuplicateHandling;
  defaultSeparator?: string;
}
