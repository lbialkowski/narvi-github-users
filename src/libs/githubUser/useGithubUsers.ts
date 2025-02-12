import { useInfiniteQuery } from "@tanstack/react-query";
import { getGithubUsers } from "./apiCalls";

// please note that this is just quick solution, normally I would split those into multiple files

type GithubUsersQueryParams = {
  search?: string;
  itemsPerPage: number;
};

// https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
export const githubUsersQueryKeys = {
  all: ["github-users"] as const,
  lists: () => [...githubUsersQueryKeys.all, "list"] as const,
  list: (params?: GithubUsersQueryParams) =>
    [...githubUsersQueryKeys.lists(), params] as const,
};

export const useGithubUsers = (params: GithubUsersQueryParams) =>
  useInfiniteQuery({
    queryKey: githubUsersQueryKeys.list(params),
    queryFn: ({ pageParam }) => getGithubUsers({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === params.itemsPerPage ? pages.length + 1 : undefined,
    enabled: !!params.search?.length,
  });
