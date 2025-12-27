import { MigrationInterface, QueryRunner } from "typeorm";

export class DisasterMigration1766632544106 implements MigrationInterface {
    name = 'DisasterMigration1766632544106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "disasters" ("id" SERIAL NOT NULL, "disno" character varying NOT NULL, "year" integer NOT NULL, "iso" character varying(3) NOT NULL, "group" character varying NOT NULL, "subgroup" character varying NOT NULL, "disaster_type" character varying NOT NULL, "disaster_subtype" character varying, "deaths" double precision NOT NULL DEFAULT '0', "damage_usd" numeric(15,2) NOT NULL DEFAULT '0', "injured" double precision NOT NULL DEFAULT '0', "affected" double precision NOT NULL DEFAULT '0', "homeless" double precision NOT NULL DEFAULT '0', "total_affected" double precision NOT NULL DEFAULT '0', "cpi" numeric(10,7) NOT NULL DEFAULT '0', "entry_date" date, "last_update" date, "start_date" date, "end_date" date, "fid" integer NOT NULL, CONSTRAINT "UQ_a660939d5882c6c958023229614" UNIQUE ("disno"), CONSTRAINT "PK_1c8d79629e142ad7e562e81bc4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a660939d5882c6c95802322961" ON "disasters" ("disno") `);
        await queryRunner.query(`CREATE INDEX "IDX_52fac3e202002e6b527ec33f35" ON "disasters" ("iso") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd5262e617bd26052a00f9a22b" ON "disasters" ("start_date") `);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "fid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "PK_773e5c6765044bb4f4f7edbfb21" PRIMARY KEY ("fid")`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "countries_fid_seq" OWNED BY "countries"."fid"`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "fid" SET DEFAULT nextval('"countries_fid_seq"')`);
        await queryRunner.query(`ALTER TABLE "disasters" ADD CONSTRAINT "FK_c1fcc1432824e369b04d0112126" FOREIGN KEY ("fid") REFERENCES "countries"("fid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasters" DROP CONSTRAINT "FK_c1fcc1432824e369b04d0112126"`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "fid" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "countries_fid_seq"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "PK_773e5c6765044bb4f4f7edbfb21"`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "fid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd5262e617bd26052a00f9a22b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52fac3e202002e6b527ec33f35"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a660939d5882c6c95802322961"`);
        await queryRunner.query(`DROP TABLE "disasters"`);
    }

}
