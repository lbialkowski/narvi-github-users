// please note that this is just quick solution, normally I would split those into multiple files

import { GitHubUserDto } from "./dtos";

type GetGithubUsersRequestDto = {
  search?: string;
  page: number;
  itemsPerPage: number;
};

export const getGithubUsers = async ({
  search,
  page,
  itemsPerPage,
}: GetGithubUsersRequestDto): Promise<GitHubUserDto[]> => {
  const response = await fetch(
    `https://api.github.com/search/users?q=${search}&page=${page}&per_page=${itemsPerPage}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return data.items;
};
