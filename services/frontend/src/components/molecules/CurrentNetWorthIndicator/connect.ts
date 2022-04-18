import {connect} from "react-redux";
import {DateService} from "services/";
import {crossSliceSelectors, State} from "store/";
import {Cents} from "utils/types";

interface StateProps {
    /** The user's current net worth, in Cents. */
    currentNetWorth: Cents;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    currentNetWorth: crossSliceSelectors.accounts.selectCurrentNetWorth(
        state,
        "",
        DateService.getTodayAsUTCString()
    )
});

export default connect(mapStateToProps);
