import React, { Component } from "react";
    import { Dimensions, Image } from "react-native";

    const { width, height } = Dimensions.get("window");

    export default class ResizedImage extends Component {
      constructor(props) {
        super(props);
        this.state = {
          height: 0
        };
      }

      componentDidMount() {
        Image.getSize(
          this.props.source.uri,
          (srcWidth, srcHeight) => {
            const ratio = Math.min(width / srcWidth, height / srcHeight);
            this.setState({ height: srcHeight * ratio });
          },
          error => console.log(error)
        );
      }
      componentWillUnmount() {
        this.setState({ height: 0 });
      }

      render() {
        const { source} = this.props;
        return (
          <Image
            source={{ uri: source.uri }}
            style={{
              width: width * 0.9,
              height: this.state.height
            }}
            resizeMode={"cover"}
          />
        );
      }
    }