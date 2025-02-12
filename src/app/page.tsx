import { GithubUsers } from "@/libs/githubUser";
import { Container, Box, Typography } from "@mui/material";

export const metadata = {
  title: "App Router",
};

export default function Page() {
  return (
    <Container fixed>
      <Box
        sx={{
          my: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Hello Narvi :)
        </Typography>
      </Box>
      <GithubUsers />
    </Container>
  );
}
