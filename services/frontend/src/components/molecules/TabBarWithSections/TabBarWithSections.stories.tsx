import React, {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {LabelledInput} from "components/molecules";
import TabBarWithSections from "./TabBarWithSections";

export default {
    title: "Molecules/Tab Bar with Sections",
    component: TabBarWithSections
};

const tabs = [
    {
        label: "Test 1",
        labelId: "test-1",
        controlsId: "test-1-a"
    },
    {
        label: "Test 2",
        labelId: "test-2",
        controlsId: "test-2-a"
    },
    {
        label: "Test 3",
        labelId: "test-3",
        controlsId: "test-3-a"
    },
    {
        label: "Test 4",
        labelId: "test-4",
        controlsId: "test-4-a"
    }
];

/** An example of how to implement the 'uncontrolled' `TabBarWithSections` with 4 tabs. */
export const Uncontrolled = () => (
    <TabBarWithSections tabs={tabs}>
        <LabelledInput label="Test" />
        <div className="test2">test2</div>
        <div className="test3">test3</div>
        <div className="test4">test4</div>
    </TabBarWithSections>
);

/** An example of how to 'control' the `TabBarWithSections` externally. */
export const Controlled = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <TabBarWithSections activeTab={activeTab} tabs={tabs} setActiveTab={setActiveTab}>
            <LabelledInput label="Test" />
            <div className="test2">test2</div>
            <div className="test3">test3</div>
            <div className="test4">test4</div>
        </TabBarWithSections>
    );
};

/** An example of how to 'control' the `TabBarWithSections` using react-hook-form. */
export const ControlledWithReactHookForm = () => {
    const {control} = useForm();

    return (
        <Controller
            control={control}
            name="activeTab"
            defaultValue={0}
            render={({value, onChange}) => (
                <TabBarWithSections activeTab={value} tabs={tabs} setActiveTab={onChange}>
                    <LabelledInput label="Test" />
                    <div className="test2">test2</div>
                    <div className="test3">test3</div>
                    <div className="test4">test4</div>
                </TabBarWithSections>
            )}
        />
    );
};
