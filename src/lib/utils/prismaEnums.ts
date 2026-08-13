/**
 * Constantes de enums de Prisma seguras para usar en Client Components.
 * Se derivan de los esquemas Zod generados en vez de importar directo de
 * '@prisma/client', para no arrastrar el motor de Prisma al bundle del cliente.
 */
import { ChangeTypeSchema, MuscleGroupSchema, QuotesDisplayModeSchema, SetTypeSchema } from '@/lib/zodSchemas';

export const MuscleGroup = MuscleGroupSchema.enum;
export type MuscleGroup = keyof typeof MuscleGroup;

export const SetType = SetTypeSchema.enum;
export type SetType = keyof typeof SetType;

export const ChangeType = ChangeTypeSchema.enum;
export type ChangeType = keyof typeof ChangeType;

export const QuotesDisplayMode = QuotesDisplayModeSchema.enum;
export type QuotesDisplayMode = keyof typeof QuotesDisplayMode;
