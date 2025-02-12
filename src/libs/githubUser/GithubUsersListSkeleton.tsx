import { Box, BoxProps, Skeleton } from "@mui/material";

const GithubUsersListSkeletonItem = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      py: 1,
      px: 2,
      gap: 2,
      w: "100%",
    }}
  >
    <Skeleton variant="circular" width={40} height={40} />
    <Skeleton width={200} />
  </Box>
);

export const GithubUsersListSkeleton = (props: BoxProps) => (
  <Box {...props}>
    <GithubUsersListSkeletonItem />
    <GithubUsersListSkeletonItem />
    <GithubUsersListSkeletonItem />
    <GithubUsersListSkeletonItem />
    <GithubUsersListSkeletonItem />
  </Box>
);
