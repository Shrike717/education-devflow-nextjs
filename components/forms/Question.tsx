"use client";

import React, { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionsSchema } from "@/lib/validations";
// Imports for Editor:
import { Editor } from "@tinymce/tinymce-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { createQuestion } from "@/lib/actions/question.action";
import { useRouter, usePathname } from "next/navigation";

// Variable, seting the type of the question button
const type: any = "create";

// Props interface
interface Props {
  mongoUser: string;
}

const Question = ({ mongoUser }: Props) => {
  // We need to set a state for the button, so that it can't be pressed twice
  const [isSubmitting, setIsSubmitting] = useState(false);

  // router and pathname
  const router = useRouter();
  const pathname = usePathname(); // Wee use this to know on which url we are right now

  // Here we initialize the hook for the editor
  const editorRef = useRef(null); // With this we can access the editor values

  // Zod 1. Define your form.
  const form = useForm<z.infer<typeof QuestionsSchema>>({
    resolver: zodResolver(QuestionsSchema),
    defaultValues: {
      title: "",
      explanation: "",
      tags: [],
    },
  });

  // Zod 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof QuestionsSchema>) {
    // We set the button to disabled and show a loading state. This prevents the button from being pressed twice.
    setIsSubmitting(true);

    // console.log("[Question onSubmit] values:", values);

    // Here we can make two things: Create a new question or edit an existing one
    try {
      // We mak an async call to the backend -> createQuestion
      // We need to pass the values from the form to the backend

      await createQuestion({
        title: values.title,
        content: values.explanation,
        tags: values.tags,
        author: JSON.parse(mongoUser),
      });

      // Redirect to Homepage after the question was created
      router.push("/");
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function for getting the tags
  const handleInputKeyDown = (
    // TS: React.KeyboardEvent<HTMLInputElement> is the type of the event
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) => {
    // When the user presses Enter and the field name is tags then we want to add the tag to the array
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();

      // Here we get the value of the input field
      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tag must be less than 15 characters",
          });
        }

        // We check if the tag is already in the array
        if (!field.value.includes(tagValue as never)) {
          // If not, then we add it to the array
          form.setValue("tags", [...field.value, tagValue]);
          // And after that we clear the input field
          tagInput.value = "";
          // And the form should clear the errors and tags alo
          form.clearErrors("tags");
        }
      }
    } else {
      // If enter was not pressed, then we trigger the validation manually
      form.trigger();
    }
  };

  // Function for removing the tags
  const handleTagRemove = (tag: string, field: any) => {
    // We get the tags from the array
    const tags = field.value;
    // We filter the tags and remove the one that was clicked
    const filteredTags = tags.filter((t: string) => t !== tag);
    // And then we set the new value of the tags
    form.setValue("tags", filteredTags);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                {/* Asterix means mandatory */}
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <Input
                  className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FormDescription>
              {/* FormMessage is for the error */}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                {/* Asterix means mandatory */}
                Detailed explanation of your problem.{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                {/* Editor component */}
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue=""
                  // Witth the following two lines we can access the values of the editor
                  onBlur={field.onBlur}
                  onEditorChange={(content) => field.onChange(content)}
                  init={{
                    height: 350,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "codesample",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "codesample | bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist ",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  }}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Introduce the problem and expand on what you put in the title.
                Minimum 20 characters.
              </FormDescription>
              {/* FormMessage is for the Error */}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                {/* Asterix means mandatory */}
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <>
                  <Input
                    className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                    placeholder="Add tags..."
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />

                  {/* Here we show the tags */}
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 gap-2.5">
                      {field.value.map((tag: any) => (
                        <Badge
                          key={tag}
                          className="subtle-medium background-light800_dark300 text-light400_light500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize"
                          onClick={() => handleTagRemove(tag, field)}
                        >
                          {tag}
                          <Image
                            src="/assets/icons/close.svg"
                            alt="Close icon"
                            width={12}
                            height={12}
                            className="cursor-pointer object-contain invert-0 dark:invert"
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what your question is about. You
                need to press enter to add a tag.
              </FormDescription>
              {/* FormMessage is for the Error */}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="primary-gradient w-fit !text-light-900"
          disabled={isSubmitting} // If the button is disabled, then we show a loading state. This prevents the button from being pressed twice.
        >
          {isSubmitting ? (
            <>{type === "edit" ? "Editing..." : "Posting..."}</>
          ) : (
            <>{type === "edit" ? "Edit Question" : "Ask a Question"}</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default Question;
