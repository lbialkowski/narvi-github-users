import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemProps,
  ListItemText,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { GitHubUserDto } from "./dtos";

type GithubUsersListItemProps = {
  user: GitHubUserDto;
} & ListItemProps;

export const GithubUsersListItem = ({
  user,
  ...restProps
}: GithubUsersListItemProps) => {
  const { avatar_url, login, html_url } = user;

  return (
    <ListItem {...restProps}>
      <ListItemAvatar>
        <Avatar>
          <Image
            src={avatar_url}
            alt={login}
            width={40}
            height={40}
            style={{ borderRadius: "50%" }}
          />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography
            component="a"
            href={html_url}
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            {login}
          </Typography>
        }
      />
    </ListItem>
  );
};
