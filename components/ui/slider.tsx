import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn("relative flex w-full touch-none select-none items-center py-4", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center">
        <SliderPrimitive.Track className="bg-neutral-200 relative h-1.5 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Indicator className="bg-emerald-500 absolute h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-6 w-6 rounded-full border-2 border-emerald-500 bg-white shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-95 cursor-grab active:cursor-grabbing z-10"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
