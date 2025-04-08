import type {
  TagDuplicateHandling,
  TagOption,
  TagInputValue,
  TagValue,
} from "./types";

/**
 * Updates a tag value based on the duplicate handling strategy
 *
 * @template T - The type parameter constraining tag names to a string type
 * @param {Record<T, TagValue>} fields - The current fields object
 * @param {T} tag - The tag name
 * @param {string} value - The new tag value
 * @param {TagDuplicateHandling} handlingType - The duplicate handling strategy
 * @param {string} separator - The separator for join strategy
 * @returns {Record<T, TagValue>} - Updated fields object
 */
const updateTagValue = <T extends string = string>(
  fields: Record<T, TagValue>,
  tag: T,
  value: string,
  handlingType: TagDuplicateHandling,
  separator: string
): Record<T, TagValue> => {
  const updatedFields = { ...fields };

  if (tag in updatedFields) {
    if (handlingType === "overwrite") {
      updatedFields[tag] = value;
    } else if (handlingType === "array") {
      updatedFields[tag] = Array.isArray(updatedFields[tag])
        ? [...(updatedFields[tag] as string[]), value]
        : [updatedFields[tag] as string, value];
    } else if (handlingType === "join") {
      updatedFields[tag] =
        typeof updatedFields[tag] === "string"
          ? updatedFields[tag] + separator + value
          : (updatedFields[tag] as string[]).join(separator) +
            separator +
            value;
    }
  } else {
    updatedFields[tag] = value;
  }

  return updatedFields;
};

/**
 * Processes a dynamic tag (when tagOptions is empty)
 *
 * @template T - The type parameter constraining tag names to a string type
 * @param {string} word - The word to process
 * @param {Record<T, TagValue>} fields - The current fields object
 * @param {T[]} detected - The list of detected tags
 * @param {TagDuplicateHandling} defaultDuplicateHandling - The default duplicate handling strategy
 * @param {string} defaultSeparator - The default separator for join strategy
 * @returns {{ fields: Record<T, TagValue>, detected: T[], isTag: boolean }} - Updated fields, detected tags, and if word was a tag
 */
const processDynamicTag = <T extends string = string>(
  word: string,
  fields: Record<T, TagValue>,
  detected: T[],
  defaultDuplicateHandling: TagDuplicateHandling,
  defaultSeparator: string
): { fields: Record<T, TagValue>; detected: T[]; isTag: boolean } => {
  const colonIndex = word.indexOf(":");
  if (colonIndex > 0) {
    const tag = word.slice(0, colonIndex) as T;
    const value = word.slice(colonIndex + 1);

    // For dynamically detected tags, use the default duplicate handling
    const updatedFields = updateTagValue(
      fields,
      tag,
      value,
      defaultDuplicateHandling,
      defaultSeparator
    );

    const updatedDetected = [...detected];
    if (!updatedDetected.includes(tag)) {
      updatedDetected.push(tag);
    }

    return { fields: updatedFields, detected: updatedDetected, isTag: true };
  }

  return { fields, detected, isTag: false };
};

/**
 * Processes a predefined tag (from tagOptions list)
 *
 * @template T - The type parameter constraining tag names to a string type
 * @param {string} word - The word to process
 * @param {TagOption<T>[]} tagOptions - The list of tag options
 * @param {Record<T, TagValue>} fields - The current fields object
 * @param {T[]} detected - The list of detected tags
 * @param {TagDuplicateHandling} defaultDuplicateHandling - The default duplicate handling strategy
 * @param {string} defaultSeparator - The default separator for join strategy
 * @returns {{ fields: Record<T, TagValue>, detected: T[], isTag: boolean }} - Updated fields, detected tags, and if word was a tag
 */
const processPredefinedTag = <T extends string = string>(
  word: string,
  tagOptions: TagOption<T>[],
  fields: Record<T, TagValue>,
  detected: T[],
  defaultDuplicateHandling: TagDuplicateHandling,
  defaultSeparator: string
): { fields: Record<T, TagValue>; detected: T[]; isTag: boolean } => {
  // Check for tag matches from the tagOptions array
  const keyWordMatch = tagOptions.find((option) =>
    typeof option === "string"
      ? word.startsWith(option + ":")
      : word.startsWith(option.tag + ":")
  );

  if (keyWordMatch) {
    const tag =
      typeof keyWordMatch === "string" ? (keyWordMatch as T) : keyWordMatch.tag;
    const value = word.slice(
      (typeof keyWordMatch === "string" ? keyWordMatch : keyWordMatch.tag)
        .length + 1
    );
    const handlingType =
      typeof keyWordMatch === "string"
        ? defaultDuplicateHandling
        : keyWordMatch.type;
    const separator =
      typeof keyWordMatch === "string"
        ? defaultSeparator
        : keyWordMatch.type === "join" && keyWordMatch.separator
        ? keyWordMatch.separator
        : defaultSeparator;

    // Handle the tag value based on the configured duplicate handling strategy
    const updatedFields = updateTagValue(
      fields,
      tag,
      value,
      handlingType,
      separator
    );

    const updatedDetected = [...detected];
    if (!updatedDetected.includes(tag)) {
      updatedDetected.push(tag);
    }

    return { fields: updatedFields, detected: updatedDetected, isTag: true };
  }

  return { fields, detected, isTag: false };
};

/**
 * Parses input text and extracts tags and their values
 *
 * @template T - The type parameter constraining tag names to a string type
 * @param {string} inputValue - The raw input text
 * @param {TagOption<T>[]} tagOptions - The list of tag options
 * @param {TagDuplicateHandling} defaultDuplicateHandling - The default duplicate handling strategy
 * @param {string} defaultSeparator - The default separator for join strategy
 * @returns {{ parsedOutput: TagInputValue<T>, detectedTags: T[] }} - The parsed output and detected tags
 */
const parseInputText = <T extends string = string>(
  inputValue: string,
  tagOptions: TagOption<T>[],
  defaultDuplicateHandling: TagDuplicateHandling,
  defaultSeparator: string
): { parsedOutput: TagInputValue<T>; detectedTags: T[] } => {
  // Initialize containers for parsed data
  let fields: Record<T, TagValue> = {} as Record<T, TagValue>;
  const detected: T[] = [];
  const defaultText: string[] = [];

  // Split the input text by spaces to process each word
  const words = inputValue.split(" ");

  for (const word of words) {
    let isTag = false;

    // If tagOptions is empty/undefined, any word with colon is considered a tag
    if (tagOptions.length === 0) {
      const result = processDynamicTag(
        word,
        fields,
        detected,
        defaultDuplicateHandling,
        defaultSeparator
      );
      fields = result.fields;
      if (result.isTag) {
        isTag = true;
      }
    } else {
      const result = processPredefinedTag(
        word,
        tagOptions,
        fields,
        detected,
        defaultDuplicateHandling,
        defaultSeparator
      );
      fields = result.fields;
      if (result.isTag) {
        isTag = true;
      }
    }

    // If not a tag, add to default text
    if (!isTag) {
      defaultText.push(word);
    }
  }

  // Create the new output structure
  const parsedOutput: TagInputValue<T> = {
    default: defaultText.join(" "),
    tags: fields,
  };

  return { parsedOutput, detectedTags: detected };
};

export {
  parseInputText,
  updateTagValue,
  processDynamicTag,
  processPredefinedTag,
};
