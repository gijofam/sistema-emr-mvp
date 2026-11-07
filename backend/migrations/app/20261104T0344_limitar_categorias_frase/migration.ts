#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a46586418c7242df109fad0729ca7ef0e3bfec9a3a33557d93d0d057d5bbc4fc/contract';
import endContract from '../../snapshots/a46586418c7242df109fad0729ca7ef0e3bfec9a3a33557d93d0d057d5bbc4fc/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/be8560a7ed16cb973e48bc9face5dae455f380806bbd66fef72bbeaa31468dee/contract';
import startContract from '../../snapshots/be8560a7ed16cb973e48bc9face5dae455f380806bbd66fef72bbeaa31468dee/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'frase',
        constraint: 'frase_categoria_check_8b0a510f',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'frase',
        constraint: 'frase_categoria_check_96fea824',
        expression:
          "\"categoria\" IN ('QUIEBRE', 'RENACER', 'EVOLUCION', 'DISCIPLINA', 'CONSTANCIA', 'RESILIENCIA', 'FORTALEZA_MENTAL', 'PROPOSITO', 'IDENTIDAD', 'AUTODOMINIO')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
