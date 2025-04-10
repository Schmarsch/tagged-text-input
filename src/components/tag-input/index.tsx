"use client";

import React, { useCallback, useEffect } from "react";
import { CustomBadge } from "./components";
import type { TagInputProps, TagInputValue, TagOption } from "./types";
import { parseInputText } from "./util";

/**
 * TagInput component allows users to input text with embedded tags.
 *
 * The component parses the input text and extracts tags in the format "tag:value".
 * When tagOptions is provided, only tags from that list are recognized.
 * When tagOptions is empty or undefined, any word with a colon is treated as a tag.
 *
 * @template T - The type parameter constraining tag names to a string type.
 * @param {TagInputProps<T>} props - The component props.
 * @returns {JSX.Element} The rendered TagInput component.
 *
 * @example
 * // With specific tag options
 * <TagInput tagOptions={["priority", "status"]} onChange={handleChange} />
 *
 * // With any tag allowed
 * <TagInput onChange={handleChange} />
 */
export const TagInput = <T extends string = string>({
  tagOptions = [] as TagOption<T>[],
  onChange,
  value,
  placeholder,
  defaultDuplicateHandling = "overwrite",
  defaultSeparator = ",",
}: TagInputProps<T>) => {
  // State to hold the raw input value (entire text with tags)
  const [inputValue, setInputValue] = React.useState(value?.default || "");

  // State to hold the parsed structure (default text and tags)
  const [parsedFields, setParsedFields] = React.useState<TagInputValue<T>>({
    default: value?.default || "",
    tags: value?.tags || ({} as Record<T, string | string[]>),
  });

  // State to track which tags have been detected in the input
  const [detectedTags, setDetectedTags] = React.useState<T[]>([]);

  // Memoized parse function to avoid recreating on every render
  const parseInput = useCallback(
    (input: string) => {
      return parseInputText(
        input,
        tagOptions,
        defaultDuplicateHandling,
        defaultSeparator
      );
    },
    [tagOptions, defaultDuplicateHandling, defaultSeparator]
  );

  /**
   * Effect hook to parse the input value and extract tags and their values.
   * This runs whenever the input value changes or when dependencies change.
   */
  useEffect(() => {
    const { parsedOutput, detectedTags: detectedTagsInside } =
      parseInput(inputValue);

    // Update detectedTags - this should happen on every input change
    setDetectedTags(detectedTagsInside);

    // Only update parsedFields if there's an actual change
    const newOutputStr = JSON.stringify(parsedOutput);
    const currentFieldsStr = JSON.stringify({
      default: parsedFields.default || "",
      tags: parsedFields.tags || {},
    });

    if (newOutputStr !== currentFieldsStr) {
      setParsedFields(parsedOutput);

      // Call the onChange callback if provided
      if (onChange) {
        onChange(parsedOutput, inputValue, detectedTags);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  /**
   * Handler for input changes.
   * Updates the inputValue state when the user types in the input field.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  /**
   * Helper function to display the tag value for different tag types
   * @param {T} tag - The tag name
   * @returns {string} The formatted tag value for display
   */
  const getTagDisplayValue = (tag: T): string => {
    const value = parsedFields.tags[tag];
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value as string;
  };

  /**
   * Handles clicking on a tag button to add a tag to the input
   * @param {T | TagOptionConfig<T>} option - The tag option to add
   */
  const handleTagButtonClick = (option: TagOption<T>) => {
    const tagName = typeof option === "string" ? option : option.tag;

    // Add a space if the current input doesn't end with one
    const spacePrefix = inputValue && !inputValue.endsWith(" ") ? " " : "";

    // Set a placeholder value that the user can replace
    const newInput = `${inputValue}${spacePrefix}${tagName}:`;

    // check if the input ends with the tag, if so, remove it
    if (inputValue.endsWith(`${tagName}:`)) {
      setInputValue(inputValue.slice(0, -`${tagName}:`.length));
      return;
    }

    setInputValue(newInput);

    // Focus the input after adding the tag
    const inputElement = document.querySelector("input") as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();

      // Position cursor before "value" so user can replace it immediately
      const cursorPosition = newInput.length - 5; // 5 is the length of "value"
      inputElement.setSelectionRange(cursorPosition, newInput.length);
    }
  };

  /**
   * Helper function to get the icon component from a tag option
   * @param {TagOption<T>} option - The tag option
   * @returns {LucideIcon | undefined} The icon component if available
   */
  const getTagIcon = (option: TagOption<T>) => {
    if (typeof option === "string") {
      return undefined;
    }
    return option.icon;
  };

  const getTagColor = (option: TagOption<T>) => {
    if (typeof option === "string") {
      return undefined;
    }
    return option.color;
  };

  return (
    <div className="selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-12 w-full rounded-md border bg-transparent px-2 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none items-center">
      <div className="flex gap-2 pr-2 overflow-hidden shrink-0">
        {/* Render detected tags as badges */}
        {Object.keys(parsedFields.tags).map((tag, index) => {
          const tagValue = getTagDisplayValue(tag as T);
          const Icon = getTagIcon(tagOptions[index] as TagOption<T>);
          const color = getTagColor(tagOptions[index] as TagOption<T>);

          return (
            <CustomBadge key={index} color={color}>
              {Icon && <Icon className="mr-1" />}
              {tagValue}
            </CustomBadge>
          );
        })}
      </div>
      <div className="relative flex flex-col w-full gap-2">
        {/* Input field */}
        <input
          placeholder={placeholder}
          onChange={handleInputChange}
          value={inputValue}
          type="text"
          className="focus:outline-0"
        />
        {/* Tag buttons section - only show if we have tag options with icons */}
        {tagOptions.length > 0 && (
          <div className="absolute right-0 flex items-center h-full gap-2">
            {tagOptions.map((option, index) => {
              const Icon = getTagIcon(option);
              const tagName = typeof option === "string" ? option : option.tag;
              return (
                <button
                  key={index}
                  onClick={() => handleTagButtonClick(option)}
                  title={`Add ${tagName} tag`}
                  className="flex items-center justify-center text-white rounded-full size-6 hover:bg-foreground/20"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
