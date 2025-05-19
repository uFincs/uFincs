import {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {LabelledInput} from "components/molecules";
import {storyUsingHooks} from "utils/stories";
import TabBarWithSections from "./TabBarWithSections";

const meta: Meta<typeof TabBarWithSections> = {
    title: "Molecules/Tab Bar with Sections",
    component: TabBarWithSections,
    args: {
        children: [
            <LabelledInput key="1" label="Test" />,
            <div className="test2" key="2">
                test2
            </div>,
            <div className="test3" key="3">
                test3
            </div>,
            <div className="test4" key="4">
                test4
            </div>
        ],
        tabs: [
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
        ]
    }
};

export default meta;
type Story = StoryObj<typeof TabBarWithSections>;

/** An example of how to implement the 'uncontrolled' `TabBarWithSections` with 4 tabs. */
export const Uncontrolled: Story = {};

/** An example of how to 'control' the `TabBarWithSections` externally. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [activeTab, setActiveTab] = useState(0);

        return <TabBarWithSections {...args} activeTab={activeTab} setActiveTab={setActiveTab} />;
    })
};

/** An example of how to 'control' the `TabBarWithSections` using react-hook-form. */
export const ControlledWithReactHookForm: Story = {
    render: storyUsingHooks((args) => {
        const {control} = useForm();

        return (
            <Controller
                control={control}
                name="activeTab"
                defaultValue={0}
                render={({value, onChange}) => (
                    <TabBarWithSections {...args} activeTab={value} setActiveTab={onChange} />
                )}
            />
        );
    })
};
