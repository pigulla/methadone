import {applyDecorators} from '@nestjs/common'
import {Transform} from "class-transformer";
import dayjs from "dayjs";
import {type Duration, type DurationUnitType} from "dayjs/plugin/duration";

export function TransformDuration(unit: DurationUnitType) {
    return applyDecorators(
        Transform(({value}) => dayjs.duration(value as number, unit), {toClassOnly: true}),
        Transform(({value}) => (value as Duration).as(unit), {toPlainOnly: true})
    )
}