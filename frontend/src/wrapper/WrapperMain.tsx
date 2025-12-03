const WrapperMain = (Component : React.ComponentType, idName : string) =>
    function HOC() {
        return(
            <div className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40" id={idName}>
                <Component />
            </div>
        );
    };

export default WrapperMain;