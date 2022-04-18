// Vendored from https://github.com/gvaldambrini/storybook-router/blob/master/packages/react/react.js
// 
// Copyright 2017 Gianni Valdambrini
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import React, {Component} from "react";
import PropTypes from "prop-types";

import {action} from "@storybook/addon-actions";
import {MemoryRouter, matchPath, Route} from "react-router";

const match = (link, path) => {
    // If the new path matches with one of the keys defined in the links object, then
    // executes the given corresponding callback value with the path as argument.
    // As behind the scene matchProps uses path-to-regexp (https://goo.gl/xgzOaL)
    // you can use parameter names and regexp within the link keys.
    return matchPath(link, {path: path, exact: true});
};

const StoryRouter = ({children, links, routerProps}) => (
    // Limitation: as MemoryRouter creates a new history object, you cannot pass it from
    // a story to another one and so you cannot implement a back or forward button which
    // works among stories.
    <MemoryRouter {...routerProps}>
        <Route
            render={({history, location}) => (
                <HistoryWatcher history={history} location={location} links={links}>
                    {children}
                </HistoryWatcher>
            )}
        />
    </MemoryRouter>
);

StoryRouter.propTypes = {
    links: PropTypes.object,
    routerProps: PropTypes.object,
    children: PropTypes.node
};

class HistoryWatcher extends Component {
    constructor(props) {
        super(props);
        this.onHistoryChanged = this.onHistoryChanged.bind(this);
    }

    componentDidMount() {
        // React on every change to the history
        this.unlisten = this.props.history.listen(this.onHistoryChanged);
    }

    componentWillUnmount() {
        // If an exception occurs during a custom componentDidMount hook the
        // HistoryWatcher::componentDidMount method will not be called and so
        // the unlisten method will not be defined.
        if (!this.unlisten) {
            return;
        }

        this.unlisten();
    }

    onHistoryChanged(location, historyAction) {
        const path = location.pathname;
        const {links} = this.props;

        for (const link in links) {
            if (match(path, link)) {
                links[link](path);
                return;
            }
        }
        action(historyAction ? historyAction : location.action)(path);
    }

    render() {
        return this.props.children;
    }
}

HistoryWatcher.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    links: PropTypes.object,
    children: PropTypes.node
};

const storyRouterDecorator = (links, routerProps) => {
    const s = (story) => (
        <StoryRouter links={links} routerProps={routerProps}>
            {story()}
        </StoryRouter>
    );
    s.displayName = "StoryRouter";
    return s;
};

export {StoryRouter};

export default storyRouterDecorator;
