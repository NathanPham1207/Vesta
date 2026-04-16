import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { styles } from "./Carousel.styles";

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedIndex: () => number;
  scrollTo: (index: number) => void;
};

type CarouselProps = {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  scrollRef: React.RefObject<ScrollView | null>;
  orientation: "horizontal" | "vertical";
  currentIndex: number;
  itemCount: number;
  setItemCount: React.Dispatch<React.SetStateAction<number>>;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  registerItemLayout: (index: number, size: number) => void;
  getItemSize: (index: number) => number;
};

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

export function Carousel({
  children,
  orientation = "horizontal",
  setApi,
}: CarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();

  const viewportSize = orientation === "horizontal" ? width : height;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const itemSizesRef = useRef<Record<number, number>>({});

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < Math.max(itemCount - 1, 0);

  const getOffsetForIndex = useCallback(
    (index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        offset += itemSizesRef.current[i] ?? viewportSize;
      }
      return offset;
    },
    [viewportSize],
  );

  const scrollTo = useCallback(
    (index: number) => {
      const safeIndex = Math.max(
        0,
        Math.min(index, Math.max(itemCount - 1, 0)),
      );
      const offset = getOffsetForIndex(safeIndex);

      scrollRef.current?.scrollTo({
        x: orientation === "horizontal" ? offset : 0,
        y: orientation === "vertical" ? offset : 0,
        animated: true,
      });

      setCurrentIndex(safeIndex);
    },
    [getOffsetForIndex, itemCount, orientation],
  );

  const scrollPrev = useCallback(() => {
    scrollTo(currentIndex - 1);
  }, [currentIndex, scrollTo]);

  const scrollNext = useCallback(() => {
    scrollTo(currentIndex + 1);
  }, [currentIndex, scrollTo]);

  const registerItemLayout = useCallback((index: number, size: number) => {
    itemSizesRef.current[index] = size;
  }, []);

  const getItemSize = useCallback(
    (index: number) => itemSizesRef.current[index] ?? viewportSize,
    [viewportSize],
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset =
        orientation === "horizontal"
          ? event.nativeEvent.contentOffset.x
          : event.nativeEvent.contentOffset.y;

      let runningOffset = 0;
      let nearestIndex = 0;

      for (let i = 0; i < itemCount; i += 1) {
        const itemSize = itemSizesRef.current[i] ?? viewportSize;
        const center = runningOffset + itemSize / 2;

        if (offset < center) {
          nearestIndex = i;
          break;
        }

        nearestIndex = i;
        runningOffset += itemSize;
      }

      setCurrentIndex(nearestIndex);
    },
    [itemCount, orientation, viewportSize],
  );

  const api = useMemo<CarouselApi>(
    () => ({
      scrollPrev,
      scrollNext,
      canScrollPrev: () => currentIndex > 0,
      canScrollNext: () => currentIndex < Math.max(itemCount - 1, 0),
      selectedIndex: () => currentIndex,
      scrollTo,
    }),
    [currentIndex, itemCount, scrollNext, scrollPrev, scrollTo],
  );

  useEffect(() => {
    setApi?.(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        scrollRef,
        orientation,
        currentIndex,
        itemCount,
        setItemCount,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        registerItemLayout,
        getItemSize,
      }}
    >
      <View style={styles.root}>{children}</View>
    </CarouselContext.Provider>
  );
}

type CarouselContentProps = {
  children: ReactNode;
};

export function CarouselContent({ children }: CarouselContentProps) {
  const { scrollRef, orientation, setItemCount } = useCarousel();
  const childArray = React.Children.toArray(children);

  useEffect(() => {
    setItemCount(childArray.length);
  }, [childArray.length, setItemCount]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal={orientation === "horizontal"}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      pagingEnabled={false}
      decelerationRate="fast"
      snapToAlignment="start"
      onMomentumScrollEnd={(event) => {
        // handled in parent through native event if needed later
      }}
      contentContainerStyle={
        orientation === "horizontal"
          ? styles.horizontalContent
          : styles.verticalContent
      }
    >
      {childArray.map((child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              index,
              key: child.key ?? index,
            })
          : child,
      )}
    </ScrollView>
  );
}

type CarouselItemProps = {
  children: ReactNode;
  index?: number;
};

export function CarouselItem({ children, index = 0 }: CarouselItemProps) {
  const { orientation, registerItemLayout } = useCarousel();
  const { width, height } = useWindowDimensions();

  return (
    <View
      onLayout={(event) => {
        const size =
          orientation === "horizontal"
            ? event.nativeEvent.layout.width
            : event.nativeEvent.layout.height;
        registerItemLayout(index, size);
      }}
      style={[
        styles.item,
        orientation === "horizontal"
          ? { width: width - 32, marginRight: 16 }
          : { minHeight: height * 0.3, marginBottom: 16 },
      ]}
    >
      {children}
    </View>
  );
}

type CarouselButtonProps = {
  onPress?: () => void;
};

export function CarouselPrevious({ onPress }: CarouselButtonProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Pressable
      style={[
        styles.navButton,
        orientation === "horizontal"
          ? styles.prevHorizontal
          : styles.prevVertical,
        !canScrollPrev && styles.navButtonDisabled,
      ]}
      disabled={!canScrollPrev}
      onPress={() => {
        scrollPrev();
        onPress?.();
      }}
    >
      <ArrowLeft size={16} color={canScrollPrev ? "#111827" : "#9CA3AF"} />
      <Text style={styles.srOnly}>Previous slide</Text>
    </Pressable>
  );
}

export function CarouselNext({ onPress }: CarouselButtonProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Pressable
      style={[
        styles.navButton,
        orientation === "horizontal"
          ? styles.nextHorizontal
          : styles.nextVertical,
        !canScrollNext && styles.navButtonDisabled,
      ]}
      disabled={!canScrollNext}
      onPress={() => {
        scrollNext();
        onPress?.();
      }}
    >
      <ArrowRight size={16} color={canScrollNext ? "#111827" : "#9CA3AF"} />
      <Text style={styles.srOnly}>Next slide</Text>
    </Pressable>
  );
}
