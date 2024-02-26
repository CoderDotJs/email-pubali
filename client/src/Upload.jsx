import { Controller, useForm } from "react-hook-form";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { reset } from "jodit/esm/core/helpers";
import { DownloadCloud, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Layout from "./Layout";

const Upload = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/files");
      return res.data.files;
    },
  });
  const mutateSendEmails = useMutation({
    mutationFn: async ({ formData }) => {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/upload",
        formData
      );
      return res;
    },
    onSuccess: () => {
      return toast.success("Uploaded!");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
    onSettled: () => {
      refetch();
      reset();
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    const newData = { ...data };
    delete newData.excel;
    const formData = new FormData();
    formData.append("excel", data.excel[0]);
    mutateSendEmails.mutate({ formData });
  };

  const mutateDeleteFile = useMutation({
    mutationFn: async ({ filename }) => {
      const res = await axios.delete(
        import.meta.env.VITE_API_URL + "/file/" + filename
      );
      return res;
    },
    onSuccess: () => {
      return toast.success("Deleted!");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
    onSettled: () => {
      refetch();
      reset();
    },
  });

  return (
    <Layout>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-sm text-gray-700">
              Excel File<span className="text-red-500 font-normal">*</span>
            </Label>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: "Excel file is required!",
                },
                validate: (value) => {
                  const acceptedFormats = ["xlx", "xlsx"];
                  const fileExtension = value[0]?.name
                    .split(".")
                    .pop()
                    .toLowerCase();
                  if (!acceptedFormats.includes(fileExtension)) {
                    return "Invalid file format. Only excel files are allowed.";
                  }
                  return true;
                },
                onChange: (e) => {
                  if (e?.target?.files[0]) {
                    return true;
                  } else {
                    return "This is required!";
                  }
                },
              }}
              render={({ field: { onChange, onBlur } }) => (
                <Input
                  id="excel"
                  type="file"
                  placeholder="Select a excel file"
                  name="excel"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    onChange(e.target.files);
                  }}
                  className="mb-3"
                  onBlur={onBlur}
                />
              )}
              name="excel"
            />
            {errors.excel && <p className="text-red-500">This is required.</p>}
          </div>
          <div className="flex justify-end items-center">
            <Button className="my-3" type="submit">
              Upload
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h5 className="text-center my-4 text-lg font-medium">Uploads</h5>
        <div>
          {data?.length === 0 && !isLoading && !isError && (
            <p>No uploads found!</p>
          )}
          {data?.length !== 0 && !isLoading && !isError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="">File Name</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading &&
                  data?.length > 0 &&
                  data?.map((row) => {
                    return (
                      <TableRow key={row}>
                        <TableCell className="font-medium">{row}</TableCell>
                        <TableCell>
                          <button className="mr-3">
                            <a
                              href={
                                import.meta.env.VITE_API_URL +
                                "/download/" +
                                row
                              }
                              download={true}
                            >
                              <DownloadCloud />
                            </a>
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Trash className="text-red-500" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the file from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    mutateDeleteFile.mutate({ filename: row })
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
