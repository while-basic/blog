"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { nanoid } from "nanoid";
import { CreateDocType } from "@/app/api/article/route";
import { PlusIcon } from "@radix-ui/react-icons";

export default function CreateArticle() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const isMutating = isFetching || isPending;
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [values, setValues] = useState<CreateDocType>({
    id: "",
    title: "",
    description: "",
    slug: "",
    tag: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsFetching(true);

    if (values.title === "") {
      setIsFetching(false);
      return toast({
        title: "Title is required.",
        description: "Please enter a title for your document.",
        variant: "destructive",
      });
    }

    // Generate a new ID before submitting the form
    const newId = nanoid(12);

    const res = await fetch("/api/article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, id: newId }),
    });

    if (!res?.ok) {
      setIsFetching(false);
      setShowCreateDialog(false);
      return toast({
        title: "Something went wrong.",
        description: "Your document was not created. Please try again.",
        variant: "destructive",
      });
    }

    const document = await res.json();
    setIsFetching(false);
    setShowCreateDialog(false);
    setValues({ id: "", title: "", description: "", slug: "", tag: "" });
    startTransition(() => {
      router.refresh();
      router.push(`/dashboard/edit/${document.id}`);
    });
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues((prevValues) => ({ ...prevValues, title: event.target.value }));
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues((prevValues) => ({
      ...prevValues,
      description: event.target.value,
    }));
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues((prevValues) => ({ ...prevValues, slug: event.target.value }));
  }

  function handleTagChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues((prevValues) => ({ ...prevValues, tag: event.target.value }));
  }

  return (
    <>
      <Button
        onClick={() => setShowCreateDialog(true)}
        variant="outline"
        className="w-full justify-start"
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        New Article
      </Button>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Article</DialogTitle>
            <DialogDescription>
              Give your article a title, description, slug and tag.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="my-1">
                  Title<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={values.title}
                  onChange={handleTitleChange}
                  placeholder="Awesome Article Title"
                />
                <p className="text-sm text-muted-foreground">
                  Add a title for the article.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description" className="my-1">
                  Description
                </Label>
                <Input
                  id="description"
                  value={values.description}
                  onChange={handleDescriptionChange}
                  placeholder="Awesome Article Description"
                />
                <p className="text-sm text-muted-foreground">
                  Add a description for the article.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug" className="my-1">
                  Slug<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={values.slug}
                  onChange={handleSlugChange}
                  placeholder="awesome-article"
                />
                <p className="text-sm text-muted-foreground">
                  Create a slug for the article.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tag" className="my-1">
                  Tag<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tag"
                  value={values.tag}
                  onChange={handleTagChange}
                  placeholder="Epic"
                />
                <p className="text-sm text-muted-foreground">
                  Add a tag for the article.
                </p>
              </div>
            </div>
            <DialogFooter>
              {!isMutating ? (
                <Button type="submit">Create</Button>
              ) : (
                <Button disabled type="submit">
                  Create
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
