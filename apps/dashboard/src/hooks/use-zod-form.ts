import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";
import type { z } from "zod";

export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
  props: Omit<UseFormProps<z.infer<TSchema>>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<z.infer<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema, undefined) as any,
  });

  return form;
}
