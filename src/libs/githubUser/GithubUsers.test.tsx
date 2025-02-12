import { act, render, screen } from "@testing-library/react";
import { GithubUsers } from "./GithubUsers";
import { GitHubUserDto } from "./dtos";
import { getGithubUsers } from "./apiCalls";
import { AppQueryClientProvider } from "../common";
import userEvent from "@testing-library/user-event";

jest.mock("./apiCalls");

const mockUser: GitHubUserDto = {
  id: 1234,
  avatar_url: "https://example.com/avatar.png",
  login: "testuser",
  html_url: "https://github.com/testuser",
};

test("should correctly find users", async () => {
  (getGithubUsers as jest.Mock).mockResolvedValue([mockUser]);
  // remove delay inorder to let it work with fake timers
  const user = userEvent.setup({ delay: null });

  render(
    <AppQueryClientProvider>
      <GithubUsers />
    </AppQueryClientProvider>
  );

  const searchTextField = screen.getByRole("searchbox", {
    name: /start typing to find some cool users/i,
  });

  // this is how we skip 2 secs delay (to optimize tests performance)
  jest.useFakeTimers();

  await user.type(searchTextField, "Phrase");

  // revoke timers as it was
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();

  expect(getGithubUsers).toHaveBeenCalledWith({
    search: "Phrase",
    page: 0,
    itemsPerPage: expect.any(Number),
  });

  const userLink = await screen.findByRole("link", { name: /testuser/i });
  expect(userLink).toBeInTheDocument();
});
