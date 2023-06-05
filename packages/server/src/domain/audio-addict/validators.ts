import { applyDecorators } from '@nestjs/common'
import { IsInt, IsPositive, IsString, Matches } from 'class-validator'
import { type ValidationOptions } from 'class-validator/types/decorator/ValidationOptions'

export const IsChannelID = (validationOptions?: ValidationOptions) =>
    applyDecorators(IsInt(validationOptions), IsPositive(validationOptions))

export const IsChannelKey = (validationOptions?: ValidationOptions) =>
    applyDecorators(
        IsString(validationOptions),
        Matches(/^[_a-z0-9]+$/, validationOptions),
    )

export const IsTrackID = (validationOptions?: ValidationOptions) =>
    applyDecorators(IsInt(validationOptions), IsPositive(validationOptions))

export const IsArtistID = (validationOptions?: ValidationOptions) =>
    applyDecorators(IsInt(validationOptions), IsPositive(validationOptions))

export const IsChannelFilterID = (validationOptions?: ValidationOptions) =>
    applyDecorators(IsInt(validationOptions), IsPositive(validationOptions))

export const IsChannelFilterKey = (validationOptions?: ValidationOptions) =>
    applyDecorators(
        IsString(validationOptions),
        Matches(/^[a-z]+$/, validationOptions),
    )

export const IsNetworkID = (validationOptions?: ValidationOptions) =>
    applyDecorators(IsInt(validationOptions), IsPositive(validationOptions))

export const IsNetworkKey = (validationOptions?: ValidationOptions) =>
    applyDecorators(
        IsString(validationOptions),
        Matches(/^[a-z]+$/, validationOptions),
    )
