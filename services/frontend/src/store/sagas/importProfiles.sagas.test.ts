import {call} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import api from "api/";
import {ImportProfile, ImportProfileMapping} from "models/";
import {
    importProfilesSlice,
    importProfilesRequestsSlice,
    importProfileMappingsSlice,
    toastsSlice
} from "store/";
import {RollbackPayload} from "store/utils";
import {silenceConsoleErrors, SAGA_TIMEOUT} from "utils/testHelpers";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";
import importProfilesSaga, * as sagas from "./importProfiles.sagas";

const mapping = new ImportProfileMapping();
const validProfile = new ImportProfile({name: "test", importProfileMappings: [mapping]});

describe("fetchAllEffect saga", () => {
    const mapping1 = new ImportProfileMapping();
    const mapping2 = new ImportProfileMapping();

    const profile1 = new ImportProfile({importProfileMappings: [mapping1]});
    const profile2 = new ImportProfile({importProfileMappings: [mapping2]});

    const profiles = [profile1, profile2];

    const expectedProfilesById = {
        [profile1.id]: {
            ...profile1,
            importProfileMappingIds: [mapping1.id],
            importProfileMappings: []
        },
        [profile2.id]: {
            ...profile2,
            importProfileMappingIds: [mapping2.id],
            importProfileMappings: []
        }
    };

    const expectedMappingsById = {[mapping1.id]: mapping1, [mapping2.id]: mapping2};

    it("fetches all of the import profiles and mappings", () => {
        return expectSaga(sagas.fetchAllEffect)
            .provide([[call(api.service("importProfiles").find), profiles]])
            .call(api.service("importProfiles").find)
            .put({
                ...importProfilesSlice.actions.set(expectedProfilesById),
                meta: {
                    decrypt: EncryptionSchema.mapOf("importProfile")
                }
            })
            .put({
                ...importProfileMappingsSlice.actions.set(expectedMappingsById),
                meta: {
                    decrypt: EncryptionSchema.mapOf("importProfileMapping")
                }
            })
            .run();
    });
});

describe("create saga", () => {
    describe("createCommit saga", () => {
        it("can create a new import profile", () => {
            return expectSaga(sagas.createCommit, {type: "", payload: validProfile})
                .put(importProfilesSlice.actions.add(validProfile))
                .put(importProfileMappingsSlice.actions.addMany([mapping]))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("throws an error if the profile is invalid", async () => {
            silenceConsoleErrors();

            const invalidProfile = new ImportProfile();

            try {
                await expectSaga(sagas.createCommit, {type: "", payload: invalidProfile}).run();
            } catch (e) {
                expect(e).toEqual(expect.anything());
            }
        });
    });

    describe("createEffect saga", () => {
        it("can request to create a new import profile", () => {
            return expectSaga(sagas.createEffect, {type: "", payload: validProfile})
                .provide([[matchers.call.fn(api.service("importProfiles").create), null]])
                .call.fn(api.service("importProfiles").create)
                .run();
        });
    });

    describe("createRollback saga", () => {
        it("can rollback creation by deleting the import profile and issuing a toast", () => {
            const payload = new RollbackPayload({rollbackData: validProfile});

            return expectSaga(sagas.createRollback, {type: "", payload})
                .put(importProfilesSlice.actions.delete(validProfile.id))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can abort rolling back if the API error was for trying to create a duplicate profile", () => {
            const error = {code: 400, errors: [{message: "id must be unique"}]};
            const payload = new RollbackPayload({rollbackData: validProfile, error});

            return expectSaga(sagas.createRollback, {type: "", payload})
                .not.put.actionType(importProfilesSlice.actions.delete.type)
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("saga registration", () => {
    describe("fetchAll", () => {
        it("has the commit saga registered", () => {
            return expectSaga(importProfilesSaga)
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.request())
                .put(importProfilesRequestsSlice.fetchAll.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(importProfilesSaga)
                .provide([[matchers.call.fn(api.service("importProfiles").find), []]])
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectStart())
                .put(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("create", () => {
        it("has the commit saga registered", () => {
            return expectSaga(importProfilesSaga)
                .dispatch(importProfilesRequestsSlice.create.actions.request(validProfile))
                .put(importProfilesRequestsSlice.create.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(importProfilesSaga)
                .provide([[matchers.call.fn(api.service("importProfiles").create), null]])
                .dispatch(importProfilesRequestsSlice.create.actions.effectStart())
                .put(importProfilesRequestsSlice.create.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(importProfilesSaga)
                .dispatch(
                    importProfilesRequestsSlice.create.actions.rollbackStart(
                        new RollbackPayload({rollbackData: validProfile})
                    )
                )
                .put(importProfilesRequestsSlice.create.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });
});
