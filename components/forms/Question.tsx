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
// Importe für Editor:
import { Editor } from "@tinymce/tinymce-react";
import { Badge } from "../ui/badge";
import Image from "next/image";

// Variable, die den Type für den Button setzt:
const type: any = "create";

const Question = () => {
  // Wir setzen ein Sicherheitsstate für das Submitten der Daten
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hier initialisieren wie useRef für den Editor:
  const editorRef = useRef(null); // Damit holen wir uns die Werte, die eingegeben werden

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
  function onSubmit(values: z.infer<typeof QuestionsSchema>) {
    // Wir setzen den Sicherheitsstate auf true. Damit wird verhindert, dass der Button zweimal gedrückt werden kann und Chaos in der Datenbank verursacht
    setIsSubmitting(true);

    // Hier können wir zwei Dinge tun: eine Frage createn oder editen
    try {
      // Mache einen async Call zu unserer API -> Frae wird erstellt
      // Wir brauchn alle Werte aus dem Formular
      // Redirect zur Homepage
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }

  // Funktion für Erfassung der Tags:
  const handleInputKeyDown = (
    // TS: React.KeyboardEvent<HTMLInputElement> ist der Typ des Events
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) => {
    // Wenn Enter gedrückt wird, dann wird der Wert in das Array gepusht
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();

      // Hier holen wir uns den Wert aus dem Inputfeld
      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tag must be less than 15 characters",
          });
        }

        // Wir checken, ob es den Tag schon in den fields gibt
        if (!field.value.includes(tagValue as never)) {
          // Wenn nicht, dann wird er in einen Array gepusht
          form.setValue("tags", [...field.value, tagValue]);
          // Und danach das Inputfeld wird geleert
          tagInput.value = "";
          // Und die Form soll die Errors und die Tags auch löschen
          form.clearErrors("tags");
        }
      }
    } else {
      // Wenn Enter nicht gedrückt wurde wird die Validierung manuell getriggert.
      form.trigger();
    }
  };

  // Funktion für das Löschen der Tags
  const handleTagRemove = (tag: string, field: any) => {
    // Wir holen uns die Tags aus dem Array
    const tags = field.value;
    // Wir filtern die Tags, die nicht gelöscht werden sollen
    const filteredTags = tags.filter((t: string) => t !== tag);
    // Und setzen die neuen Tags
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
                {/* Asterix heißt mandatory */}
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
              {/* FormMessage ist für den Error */}
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
                {/* Asterix heißt mandatory */}
                Detailed explanation of your problem.{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                {/* Editor component */}
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue="<p>This is the initial content of the editor.</p>"
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
              {/* FormMessage ist für den Error */}
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
                {/* Asterix heißt mandatory */}
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <>
                  <Input
                    className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                    placeholder="Add tags..."
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />

                  {/* Hier werden die Tags angezeigt */}
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
              {/* FormMessage ist für den Error */}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="primary-gradient w-fit !text-light-900"
          disabled={isSubmitting} // Wenn der Button gedrückt wird, dann wird er disabled. Das verhindert, dass der Button zweimal gedrückt werden kann.
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
