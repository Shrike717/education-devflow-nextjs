"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnswersSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
// Imports for Editor:
// import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { usePathname } from "next/navigation";
import { toast } from "../ui/use-toast";

interface Props {
  question: string;
  questionId: string;
  authorId: string;
}

const Answer = ({ question, questionId, authorId }: Props) => {
  // Getting the current path  where the user is, so that we can update a page after the answer is created. We need to pass the path to:
  const pathname = usePathname();
  // Here we use the mode ccntext to  show editor dark skin in dark mode
  const { mode } = useTheme();

  // We need to set a state for the button, so that it can't be pressed twice
  const [isSubmitting, setIsSubmitting] = useState(false);
  // We need to have a state for hhe AI functionalty
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);

  // Here we initialize the hook for the editor
  const editorRef = useRef<TinyMCEEditor | null>(null); // With this we can access the editor values

  // Zod 1. Define your form.
  const form = useForm<z.infer<typeof AnswersSchema>>({
    resolver: zodResolver(AnswersSchema),
    defaultValues: {
      answer: "",
    },
  });

  // 2. Define your submit handler:
  const handleCreateAnswer = async (values: z.infer<typeof AnswersSchema>) => {
    setIsSubmitting(true); // We set the state to true, so that the button can't be pressed twice

    try {
      await createAnswer({
        content: values.answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname, // This is needed to update the page after the answer is created
      });

      // Then we reset the form
      form.reset();
      // And we reset the editor
      if (editorRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editor = editorRef.current as any;
        editor.setContent("");
      }
    } catch (error) {
      console.error("Error creating answer", error);
    } finally {
      setIsSubmitting(false); // We set the state to false, so that the button can be pressed again
    }
  };

  // This function is for generating an AI answer
  const generateAIAnswer = async () => {
    // First we check if there is an authorId:
    if (!authorId) {
      return toast({
        // This function has been imported from the use-toast.tsx file
        title: "Please log in",
        description: "You must be logged in to perform this action",
      });
    }

    // If there is one we set the loader state to true:
    setIsSubmittingAI(true);

    //
    try {
      // Here we make a call to our own API endpoint to generate an AI answer
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,
        {
          method: "POST",
          body: JSON.stringify({ question }),
        }
      );

      // We parse the response
      const aiAnswer = await response.json();

      // Then we need to convert plain text to HTML:
      const formattedAnswer = aiAnswer.reply.replace(/\n/g, "<br />");

      // Then we need to check if a reference to the editor exists
      if (editorRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editor = editorRef.current as any; // We define the editor as any, because the editor is not typed
        editor.setContent(formattedAnswer); // We set the content of the editor to the AI answer
      }

      // Later we add a Toast to show the user that the AI answer was generated
    } catch (error) {
      console.error("Error generating AI answer", error);
    } finally {
      setIsSubmittingAI(false);
    }
  };

  return (
    <div>
      <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800 ">
          Write your answer here:
        </h4>

        <Button
          className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          onClick={generateAIAnswer}
        >
          {isSubmittingAI ? (
            <>Generating...</>
          ) : (
            <>
              <Image
                src="/assets/icons/stars.svg"
                alt="star"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form
          className="mt-6 flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(handleCreateAnswer)}
        >
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  {/* Editor component */}
                  <TinyMCEEditor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => (editorRef.current = editor)}
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
                      skin: mode === "dark" ? "oxide-dark" : "oxide",
                      content_css: mode === "dark" ? "dark" : "light",
                    }}
                  />
                </FormControl>

                {/* FormMessage is for the Error */}
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit  !text-light-900"
              disabled={isSubmitting} // If the button is disabled, then we show a loading state. This prevents the button from being pressed twice.
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Answer;
