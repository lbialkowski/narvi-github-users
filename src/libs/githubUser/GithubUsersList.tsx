import { BaseInfiniteList } from "../ui";
import { GithubUsersListItem } from "./GithubUsersListItem";
import { GithubUsersListSkeleton } from "./GithubUsersListSkeleton";
import { Alert, List } from "@mui/material";
import { useGithubUsers } from "./hooks";
import { memo } from "react";

type GithubUsersListProps = { search?: string };

export const GithubUsersList = memo(({ search }: GithubUsersListProps) => {
  const {
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    data,
    isLoadingError,
    isLoading,
    isFetchNextPageError,
  } = useGithubUsers({
    itemsPerPage: 50,
    search,
  });

  const allItems = data?.pages.flatMap((page) => page);

  if (isLoading) {
    return <GithubUsersListSkeleton />;
  }

  if (isLoadingError) {
    return (
      <Alert
        severity="error"
        sx={{
          mt: 1,
        }}
      >
        An error occured during fetching users
      </Alert>
    );
  }

  if (allItems?.length === 0) {
    return (
      <Alert
        severity="info"
        sx={{
          mt: 1,
          // I found a bug in mui
          backgroundColor: "var(--mui-palette-Alert-infoStandardBg)",
        }}
      >
        Unluckily, we haven&apos;t found any results matching your criteria
      </Alert>
    );
  }

  if (allItems) {
    return (
      <BaseInfiniteList
        ListComponent={List}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        estimateSize={56}
        items={allItems}
        renderItem={(item) => <GithubUsersListItem user={item} />}
        isFetchNextPageError={isFetchNextPageError}
        errorElement={
          <Alert severity="error">
            An error occured during fetching more users. Retrying...
          </Alert>
        }
        fetchingMoreElement={<GithubUsersListSkeleton />}
      />
    );
  }

  return null;
});

GithubUsersList.displayName = 'GithubUsersList'