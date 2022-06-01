import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { IMaxRepetitionsCondition } from "@daemons-fi/shared-definitions";
import { RepetitionsConditionFactory } from "../repetitions-condition-factory";
import { IRepetitionsConditionForm } from "../../../data/chains-data/condition-form-interfaces";
import { ScriptConditions } from "../../../data/chains-data/condition-form-interfaces";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { ICurrentScript } from "../../i-current-script";

describe("Repetitions Condition Factory", () => {
    it("creates an empty condition", async () => {
        const empty = RepetitionsConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
    });

    it("returns an empty condition when trying to build from undefined json", async () => {
        const condition = RepetitionsConditionFactory.fromJson();

        assert.deepEqual(condition, RepetitionsConditionFactory.empty());
    });

    it("restores condition from json object", async () => {
        const originalCondition: IMaxRepetitionsCondition = {
            enabled: true,
            amount: BigNumber.from(7999)
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = RepetitionsConditionFactory.fromJson(jsonCondition);

        assert.equal(JSON.stringify(condition), JSON.stringify(originalCondition));
    });

    it("throws error if form is enabled but not valid", async () => {
        const form: IRepetitionsConditionForm = {
            type: ScriptConditions.REPETITIONS,
            valid: false,
            amount: 7999
        };

        const gonnaThrow = () => RepetitionsConditionFactory.fromForm(form);
        expect(gonnaThrow).to.throw("Cannot build Repetitions condition from invalid form");
    });

    it("creates a condition from an enabled form", () => {
        const form: IRepetitionsConditionForm = {
            type: ScriptConditions.REPETITIONS,
            valid: true,
            amount: 7999
        };

        const condition = RepetitionsConditionFactory.fromForm(form);

        expect(condition.enabled).to.be.true;
        expect(condition.amount.toNumber()).to.be.equal(7999);
    });

    describe("creates a condition from a bundle", () => {
        const form: IRepetitionsConditionForm = {
            type: ScriptConditions.REPETITIONS,
            valid: true,
            amount: 7999
        };

        it("happy flow", async () => {
            const bundle: ICurrentScript = {
                id: '0x11111111111',
                description: 'lorem ipsum',
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {
                    Repetitions: {
                        title: "Repetitions",
                        info: "Whatevs",
                        form
                    }
                }
            };

            const condition = RepetitionsConditionFactory.fromBundle(bundle);

            expect(condition.enabled).to.be.true;
            expect(condition.amount.toNumber()).to.be.equal(7999);
        });

        it("returns an empty form if the balance condition is missing from the bundle", async () => {
            const emptyBundle: ICurrentScript = {
                id: '0x11111111111',
                description: 'lorem ipsum',
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {}
            };

            const condition = RepetitionsConditionFactory.fromBundle(emptyBundle);

            assert.deepEqual(condition, RepetitionsConditionFactory.empty());
        });
    });
});
