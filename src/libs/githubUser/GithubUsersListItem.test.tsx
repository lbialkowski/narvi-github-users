import { render, screen } from "@testing-library/react";
import { GithubUsersListItem } from "./GithubUsersListItem";
import { GitHubUserDto } from "./dtos";

const mockUser: GitHubUserDto = {
  id: 1234,
  avatar_url: "https://example.com/avatar.png",
  login: "testuser",
  html_url: "https://github.com/testuser",
};

test("renders user's avatar", () => {
  render(<GithubUsersListItem user={mockUser} />);
  const avatarImage = screen.getByAltText(/testuser/i);
  expect(avatarImage).toBeInTheDocument();
  expect(avatarImage.getAttribute("src")).toContain(
    encodeURIComponent(mockUser.avatar_url)
  );
});

test("renders user's login as a link", () => {
  render(<GithubUsersListItem user={mockUser} />);
  const userLink = screen.getByRole("link", { name: /testuser/i });
  expect(userLink).toBeInTheDocument();
  expect(userLink).toHaveAttribute("href", mockUser.html_url);
});
