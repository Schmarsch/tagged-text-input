"use client";

import { TagInput } from "@/components/tag-input";
import type { TagInputValue, TagOption } from "@/components/tag-input/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Mail, User, Tag, Bookmark } from "lucide-react";

// Define the custom tag types we'll be using
type CustomTagType = "email" | "name" | "title" | "label";

// Extract tag options for better maintainability with proper typing
const TAG_OPTIONS: TagOption<CustomTagType>[] = [
  { tag: "email", type: "overwrite", icon: Mail },
  { tag: "name", type: "overwrite", icon: User }, // Overwrites previous values
  { tag: "title", type: "array", icon: Tag }, // Stores all values in an array
  { tag: "label", type: "join", separator: " | ", icon: Bookmark }, // Joins values with a custom separator
];

export const Details = () => {
  // Initialize with an empty record that satisfies the Record<CustomTagType> constraint
  const [tagOutput, setTagOutput] = useState<TagInputValue<CustomTagType>>({
    default: "",
    tags: {} as Record<CustomTagType, string | string[]>,
  });

  const handleTagChange = (value: TagInputValue<CustomTagType>) => {
    setTagOutput(value);
  };

  return (
    <div className="space-y-6">
      <TagInput<CustomTagType>
        tagOptions={TAG_OPTIONS}
        onChange={handleTagChange}
        placeholder="Try typing text with tags like 'name:John' or 'email:example@mail.com'"
      />

      {/* Stylish output display */}
      <Card className="p-4 bg-slate-50 dark:bg-slate-900 border shadow-sm">
        <CardHeader>
          <CardTitle>Parsed Output</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Default text display */}
          {tagOutput.default && (
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Default Text:</p>
              <p className="p-2 bg-white dark:bg-slate-800 rounded-md">
                {tagOutput.default}
              </p>
            </div>
          )}

          {/* Tags display */}
          <div>
            <p className="text-sm text-slate-500 mb-2">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(tagOutput.tags).length > 0 ? (
                Object.entries(tagOutput.tags).map(([tag, value]) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-md"
                  >
                    <Badge variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                    <span className="text-sm">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No tags detected yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
