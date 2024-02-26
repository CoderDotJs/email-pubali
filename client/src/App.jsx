import { Button } from "./components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Input } from "./components/ui/input";
import { toast } from "sonner";
import ReactJodit from "./components/ReactJodit/ReactJodit";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { Label } from "./components/ui/label";
import Layout from "./Layout";

const App = () => {
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
    retry: 3,
  });

  return (
    <Layout>
      <div className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-6/12 mx-auto border rounded-md p-3 bg-white shadow-lg"
        >
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

          <div className="">
            <Button
              className="mt-3 bg-[#2ecc71]"
              // disabled={mutateSendEmail.isLoading}
              // onClick={() => mutateSendEmail.mutate()}
              type="submit"
            >
              Send Bulk Emails
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default App;
