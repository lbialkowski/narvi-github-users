import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";

// inspired by https://tanstack.com/virtual/latest/docs/framework/react/examples/window

export type BaseInfiniteListRef = {
  scrollToTop: () => void;
  scrollToIndex: (index: number) => void;
};

type BaseInfiniteListProps<T> = {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetchNextPageError?: boolean;
  fetchNextPage: () => Promise<unknown>;
  estimateSize: number;
  listRef?: React.Ref<BaseInfiniteListRef>;
  items: T[];
  // functional programming approach presented here, render prop function
  renderItem: (item: T) => React.ReactNode;
  fetchingMoreElement?: React.ReactNode;
  errorElement?: React.ReactNode;
  ListComponent?: React.ComponentType;
};

export const BaseInfiniteList = <T,>(props: BaseInfiniteListProps<T>) => {
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    estimateSize,
    items,
    renderItem,
    listRef,
    fetchingMoreElement,
    errorElement,
    ListComponent = "div",
    isFetchNextPageError,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const totalItems = items.length;

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? totalItems + 1 : totalItems,
    estimateSize: () => estimateSize,
    overscan: 5,
    scrollMargin: ref.current?.offsetTop ?? 0,
  });

  const { scrollToIndex } = virtualizer;

  // bonus, useful imperative handlers
  useImperativeHandle(
    listRef,
    () => ({
      scrollToTop() {
        scrollToIndex(0, { behavior: "smooth" });
      },
      scrollToIndex(index: number) {
        scrollToIndex(index, { behavior: "smooth" });
      },
    }),
    [scrollToIndex]
  );

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= totalItems - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalItems,
    virtualItems,
  ]);

  return (
    <ListComponent
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {virtualItems.map((virtualItem) => {
        const isLastExtraRow = virtualItem.index > totalItems - 1 && hasNextPage;
        const showLoader = isLastExtraRow && !!fetchingMoreElement;
        const showError = isLastExtraRow && isFetchNextPageError && !!errorElement;

        // cool functional programming pattern also here
        const elementToRender = (() => {
          if (showError) {
            return errorElement;
          }
          if (showLoader) {
            return fetchingMoreElement;
          }
          return renderItem(items[virtualItem.index]);
        })();

        return (
          // slot is used here to maintain element original tag eg. li
          <Slot
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              transform: `translateY(${
                virtualItem.start - virtualizer.options.scrollMargin
              }px)`,
            }}
          >
            {elementToRender}
          </Slot>
        );
      })}
    </ListComponent>
  );
};
