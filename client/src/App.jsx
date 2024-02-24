"use client";
import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { toast } from "sonner";
import { read, utils } from "xlsx";
import ReactJodit from "./components/ReactJodit/ReactJodit";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import Header from "./Header";
import { Label } from "./components/ui/label";

// import mailer from "./mailer";

// const SPREADSHEET_ID = "10yuaPkYGTgoRcbYwoljTpSEA1NPuXal_W4qjvUwzqjY";

const App = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // const { data, isLoading, isError, error } = useQuery({
  //   queryKey: ["list"],
  //   queryFn: async () => {
  //     const res = await axios.get(
  //       import.meta.env.VITE_API_URL + "/data/" + SPREADSHEET_ID
  //     );
  //     return res.data;
  //   },
  // });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    const newData = { ...data };
    delete newData.excel;
    const formData = new FormData();
    formData.append("data", JSON.stringify(newData));
    formData.append("excel", data.excel[0]);
    mutateSendEmails.mutate({ formData });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setIsLoading(true);
      setIsError(false);
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = read(data, { type: "binary" });

        // Assuming you have only one sheet in the Excel file
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse sheet data into JSON format
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        // const finalJson = jsonData
        //   .slice(1, jsonData.length)
        //   .filter((l) => l.length != 0);
        setData(
          jsonData.filter((f) => f.length === 2).slice(1, jsonData.length)
        );
        console.log(jsonData);
        // console.log(finalJson);
        setIsLoading(false);
      };

      reader.onerror = () => {
        setIsError(true);
        setError("Something went wrong!");
        setIsLoading(false);
      };

      reader.readAsBinaryString(file);
    }
  };

  const mutateSendEmails = useMutation({
    mutationFn: async ({ formData }) => {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/bulk-email",
        formData
      );
      return res;
    },
    onSuccess: () => {
      return toast.success("Emails sending started!");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });

  return (
    <>
      <div className="container">
        <Header />
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-sm text-gray-700">
              Excel File <span className="text-red-500 font-normal">*</span>
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
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-sm text-gray-700">
              Email Subject <span className="text-red-500 font-normal">*</span>
            </Label>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: "Subject is required!",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  type="text"
                  placeholder="Subject"
                  value={value}
                  className="mb-3"
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
              name="subject"
            />
            {errors.subject && (
              <p className="text-red-500">This is required.</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label className="text-sm text-gray-700">
              Email<span className="text-red-500 font-normal">*</span>
            </Label>

            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: "Email is required!",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  type="email"
                  placeholder="Email"
                  value={value}
                  className="mb-3"
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
              name="email"
            />
            {errors.email && <p className="text-red-500">This is required.</p>}
          </div>

          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: "Email body is required!",
              },
            }}
            render={({ field: { onChange, value, ref } }) => (
              <ReactJodit data={value} onChange={onChange} ref={ref} />
            )}
            name="emailBody"
          />
          {errors.emailBody && (
            <p className="text-red-500">This is required.</p>
          )}

          <div className="flex justify-end items-center">
            <Button
              className="my-3"
              // disabled={mutateSendEmail.isLoading}
              // onClick={() => mutateSendEmail.mutate()}
              type="submit"
            >
              Send Bulk Emails
            </Button>
          </div>
        </form>
        <div>
          <h5 className="text-center my-4 text-lg font-medium">
            Test excel file
          </h5>
          <div>
            {data?.length === 0 ? (
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="file"
                  type="file"
                  placeholder="Select a excel file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <Table>
                <TableCaption>A list of your recent emails.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  {!isLoading &&
                    data?.length > 0 &&
                    data?.map((row) => {
                      return (
                        <TableRow key={row[1]}>
                          <TableCell className="font-medium">
                            {row[0]}
                          </TableCell>
                          <TableCell>{row[1]}</TableCell>
                        </TableRow>
                      );
                    })}

                  {!isLoading && data?.length == 0 && (
                    <TableRow colSpan={2}>
                      <TableCell className="font-medium row-span-2">
                        {" "}
                      </TableCell>
                      <TableCell className="font-medium row-span-2">
                        No data found!
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && isError && (
                    <TableRow colSpan={2}>
                      <TableCell className="font-medium row-span-2">
                        {" "}
                      </TableCell>
                      <TableCell className="font-medium row-span-2">
                        {error?.message}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
