import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import dayjs, { type Dayjs } from 'dayjs'

export function TransformDayjs(options?: { nullable?: boolean }) {
    return applyDecorators(
        Transform(
            ({ value }) =>
                options?.nullable && value === null
                    ? null
                    : dayjs(value as string),
            { toClassOnly: true },
        ),
        Transform(
            ({ value }) =>
                options?.nullable && value === null
                    ? null
                    : (value as Dayjs).toISOString(),
            {
                toPlainOnly: true,
            },
        ),
    )
}
