import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import Layout from "./Layout";

const AddUser = () => {
  const { data: users, isLoading: isUserLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/users");
      return res.data.data;
    },
  });
  console.log(users);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Handle the login logic here
    mutate({ data });
  };

  const { mutate } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/register",
        data
      );
      return res;
    },
    onSuccess: () => {
      return toast.success("User Added!");
    },
    onError: (error) => {
      return toast.error(error?.response?.data?.message || error?.message);
    },
  });

  return (
    <Layout>
      <div className=" flex justify-center items-center">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Add User
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-[#026537] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#026537] sm:text-sm sm:leading-6 px-2"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    {/* <a
                  href="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a> */}
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-[#026537] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#026537] sm:text-sm sm:leading-6 px-2"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#026537] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#026537]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div>
        <h6 className="my-5 text-center">Users</h6>
        {isUserLoading && "User Loading..."}
        {users?.length > 0 && (
          <>
            <Table>
              <TableCaption>A list of users</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Email</TableHead>
                  <TableHead>Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => {
                  return (
                    <TableRow key={user?.key}>
                      <TableCell className="font-medium">
                        {user?.email}
                      </TableCell>
                      <TableCell>{user?.password}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AddUser;
