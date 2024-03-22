import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900 ">All Users</h1>
      <div className="mb-12 mt-11 flex flex-wrap gap-5">
        <Skeleton className="h-14 flex-1" />
        <Skeleton className="h-14 " />
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 9 }).map((item: number) => (
          <Skeleton
            key={item}
            className="h-60 w-full rounded-xl sm:w-[260px]"
          />
        ))}
      </div>
    </section>
  );
};

export default Loading;
