import React, { Component } from "react";
import StoreContext from "../contexts/storeContext";
import { loadBugs } from "../store/bugs";

class Bugs extends Component {
  static contextType = StoreContext;

  state = { bugs: [] };

  async componentDidMount() {
    const store = this.context;

    this.unsubscribe = store.subscribe(() => {
      const bugsInStore = store.getState().entities.bugs.list;
      if (this.state.bugs !== bugsInStore) this.setState({ bugs: bugsInStore });
    });

    await store.dispatch(loadBugs());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    const { bugs } = this.state;
    return (
      <ul>
        {bugs.map((bug) => (
          <li key={bug.id}>{bug.description}</li>
        ))}
      </ul>
    );
  }
}

export default Bugs;
