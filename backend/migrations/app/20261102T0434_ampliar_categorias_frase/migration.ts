#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/14821b37ed357192fd6e56ff6644e079a011fd0eaeaf69477554b02c9089b18c/contract';
import startContract from '../../snapshots/14821b37ed357192fd6e56ff6644e079a011fd0eaeaf69477554b02c9089b18c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/be8560a7ed16cb973e48bc9face5dae455f380806bbd66fef72bbeaa31468dee/contract';
import endContract from '../../snapshots/be8560a7ed16cb973e48bc9face5dae455f380806bbd66fef72bbeaa31468dee/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'frase',
        constraint: 'frase_categoria_check_2c70cf02',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'frase',
        constraint: 'frase_categoria_check_8b0a510f',
        expression:
          "\"categoria\" IN ('DISCIPLINA', 'QUIEBRE', 'RENACER', 'EVOLUCION', 'FORTALEZA_MENTAL', 'RESILIENCIA', 'PROPOSITO', 'CONSTANCIA', 'ENTRENAMIENTO', 'MENTALIDAD', 'PACIENCIA', 'SUPERACION', 'IDENTIDAD', 'AUTODOMINIO')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
