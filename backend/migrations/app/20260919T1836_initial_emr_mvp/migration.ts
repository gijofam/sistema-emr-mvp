#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/14821b37ed357192fd6e56ff6644e079a011fd0eaeaf69477554b02c9089b18c/contract';
import endContract from '../../snapshots/14821b37ed357192fd6e56ff6644e079a011fd0eaeaf69477554b02c9089b18c/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'contactoWhatsapp',
        columns: [
          col('activo', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('fechaRegistro', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('numero', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'frase',
        columns: [
          col('activa', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('categoria', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('codigo', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fechaCreacion', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('texto', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('vecesMostrada', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'frase_categoria_check_2c70cf02',
            "\"categoria\" IN ('DISCIPLINA', 'QUIEBRE', 'RENACER', 'EVOLUCION', 'FORTALEZA_MENTAL', 'RESILIENCIA', 'PROPOSITO', 'CONSTANCIA', 'ENTRENAMIENTO', 'MENTALIDAD', 'PACIENCIA', 'SUPERACION')",
          ),
          checkExpression('frase_codigo_positivo_eecf4a65', '"codigo" > 0'),
          checkExpression('frase_veces_mostrada_no_negativa_eff9835d', '"vecesMostrada" >= 0'),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'mensajePrenda',
        columns: [
          col('fechaDesbloqueo', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fraseId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('numeroMensaje', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('prendaId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'mensaje_prenda_numero_valido_a54d5778',
            '"numeroMensaje" BETWEEN 1 AND 3',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'prenda',
        columns: [
          col('contactoWhatsappId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('estado', 'text', {
            notNull: true,
            default: lit('GENERADA'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('etapaEmr', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fechaActivacion', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fechaCreacion', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tipoPrenda', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'prenda_estado_check_44fc3b73',
            "\"estado\" IN ('GENERADA', 'ACTIVA', 'COMPLETADA', 'INACTIVA')",
          ),
          checkExpression(
            'prenda_etapaEmr_check_1c4919c1',
            "\"etapaEmr\" IN ('QUIEBRE', 'RENACER', 'EVOLUCION')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'referido',
        columns: [
          col('codigoReferido', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('estado', 'text', {
            notNull: true,
            default: lit('PENDIENTE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('fechaConversion', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fechaCreacion', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('prendaOrigenId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'referido_estado_check_2f928fc9',
            "\"estado\" IN ('PENDIENTE', 'CONVERTIDO')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'contactoWhatsapp',
        constraint: 'contactoWhatsapp_numero_key',
        columns: ['numero'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'frase',
        constraint: 'frase_codigo_key',
        columns: ['codigo'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'mensajePrenda',
        constraint: 'mensajePrenda_prendaId_numeroMensaje_key',
        columns: ['prendaId', 'numeroMensaje'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'mensajePrenda',
        constraint: 'mensajePrenda_prendaId_fraseId_key',
        columns: ['prendaId', 'fraseId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'prenda',
        constraint: 'prenda_token_key',
        columns: ['token'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'referido',
        constraint: 'referido_codigoReferido_key',
        columns: ['codigoReferido'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'frase',
        index: 'frase_activa_idx_dadcaf98',
        columns: ['activa'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'mensajePrenda',
        index: 'mensajePrenda_fraseId_idx_a7146fb5',
        columns: ['fraseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'mensajePrenda',
        index: 'mensajePrenda_prendaId_idx_3c4934dc',
        columns: ['prendaId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'prenda',
        index: 'prenda_contactoWhatsappId_idx_b23b26c5',
        columns: ['contactoWhatsappId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'referido',
        index: 'referido_prendaOrigenId_idx_b24f10d5',
        columns: ['prendaOrigenId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'mensajePrenda',
        foreignKey: {
          name: 'mensajePrenda_prendaId_fkey',
          columns: ['prendaId'],
          references: { schema: 'public', table: 'prenda', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'mensajePrenda',
        foreignKey: {
          name: 'mensajePrenda_fraseId_fkey',
          columns: ['fraseId'],
          references: { schema: 'public', table: 'frase', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'prenda',
        foreignKey: {
          name: 'prenda_contactoWhatsappId_fkey',
          columns: ['contactoWhatsappId'],
          references: { schema: 'public', table: 'contactoWhatsapp', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'referido',
        foreignKey: {
          name: 'referido_prendaOrigenId_fkey',
          columns: ['prendaOrigenId'],
          references: { schema: 'public', table: 'prenda', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
