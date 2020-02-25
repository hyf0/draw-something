import PropTypes from 'prop-types';

// 透传 children 组件，用于 route.component = undefined 的默认值
export default function Penetrate({ children }: { children: any }) {
  return children;
}

Penetrate.propTypes = {
  children: PropTypes.node,
}

Penetrate.defaultProps = {
  children: null,
}
