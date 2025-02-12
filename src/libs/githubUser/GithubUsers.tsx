"use client";

import { useForm, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { GithubUsersList } from "./GithubUsersList";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDebounce } from "use-debounce";

type FormValues = {
  search: string;
};

// I don't really see a reason to implement form here because there is no submit action, but I did it anyway to fulfill task requirements
// please note that in production project some parts of this code should be wrapped into abstraction layer or moved to dedicated files
// also translations should be extracted into dedicated place and loaded by eg. i18next
const searchSchema = yup
  .object({
    search: yup.string().required("Type at least 1 character"),
  })
  .required();

export const GithubUsers = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
    resolver: yupResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const search = watch("search");
  const searchErrorMessage = errors.search?.message;
  // this '2000' could be moved into some config file in production app
  const [debouncedSearch] = useDebounce(search, 2000);

  return (
    <>
      <form>
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <TextField
              id="search"
              label="Start typing to find some cool users"
              type="search"
              variant="outlined"
              size="medium"
              fullWidth
              {...(searchErrorMessage
                ? { error: true, helperText: searchErrorMessage }
                : {})}
              {...field}
            />
          )}
        />
      </form>
      {/* when user removed phrase we want effect to happen immediately */}
      <GithubUsersList search={search.length ? debouncedSearch : ""} />
    </>
  );
};
